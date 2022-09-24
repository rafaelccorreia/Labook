import { PostDatabase } from "../database/PostDatabase"
import { AuthorizationError } from "../errors/AuthorizationError"
import { ConflictError } from "../errors/ConflictError"
import { NotFoundError } from "../errors/NotFoundError"
import { UnprocessableError } from "../errors/UnprocessableError"
import { IAddLikeInputDTO, IAddLikeOutputDTO, ICreatePostInputDTO, IDeletePostInputDTO, IDeletePostOutputDTO, IGetPostsOutputDTO, ILikeDB, IPostDB, IRemoveLikeInputDTO, IRemoveLikeOutputDTO, Post } from "../models/Post"
import { USER_ROLES } from "../models/User"
import { Authenticator } from "../services/Authenticator"
import { IdGenerator } from "../services/IdGenerator"

export class PostBusiness {
    constructor(
        private postDatabase: PostDatabase,
        private idGenerator: IdGenerator,
        private authenticator: Authenticator
    ) {}

    public createPost = async (input: ICreatePostInputDTO) => {
        const { token, content } = input

        const isTokenValid = this.authenticator.getTokenPayload(token)

        if(!isTokenValid) {
            throw new AuthorizationError()
        }

        if(content.length < 1) {
            throw new UnprocessableError()
        }

        const id = this.idGenerator.generate()
        const userId = isTokenValid.id

        const post = new Post(
            id,
            content,
            userId
        )

        await this.postDatabase.createPost(post)

        const response = {
            message: "Post criado com sucesso"
        }

        return response
    }

    public getPosts = async (token: string) => {
        const isTokenValid = this.authenticator.getTokenPayload(token)

        if(!isTokenValid) {
            throw new AuthorizationError()
        }

        const postsDB: IPostDB[] = await this.postDatabase.getPosts()
        

        const posts = postsDB.map( postDB => {
            return new Post(
                postDB.id,
                postDB.content,
                postDB.user_id
            )
        })

        posts.forEach(async post => {
            const postId = post.getId()

            const likes = await this.postDatabase.getLikes(postId)
            post.setLikes(likes)
        })

        const response: IGetPostsOutputDTO = {
            posts
        }

        return response
    }

    public deletePost = async (input: IDeletePostInputDTO) => {

        const { token, postId } = input

        const isTokenValid = this.authenticator.getTokenPayload(token)

        if (!isTokenValid) {
            throw new AuthorizationError()
        }

        const postDB = await this.postDatabase.findById(postId)

        if (!postDB) {
            throw new NotFoundError()
        }

        if (isTokenValid.role === USER_ROLES.NORMAL) {

            if (postDB.user_id !== isTokenValid.id) {
                throw new AuthorizationError()
            }
        }

        await this.postDatabase.deletePost(postId)

        const response: IDeletePostOutputDTO = {
            message: "Post deletado com sucesso"
        }

        return response
    }

    public addLike = async (input: IAddLikeInputDTO) => {

        const { token, postId } = input

        const isTokenValid = this.authenticator.getTokenPayload(token)

        if (!isTokenValid) {
            throw new AuthorizationError()
        }

        const postDB = await this.postDatabase.findById(postId)

        if (!postDB) {
            throw new NotFoundError()
        }

        const isAlreadyLiked = await this.postDatabase.findLike(
            postId,
            isTokenValid.id
        )

        if (isAlreadyLiked) {
            throw new ConflictError()
        }

        const id = this.idGenerator.generate()

        const likeDB: ILikeDB = {
            id: id,
            post_id: postId,
            user_id: isTokenValid.id
        }

        await this.postDatabase.addLike(likeDB)

        const response: IAddLikeOutputDTO = {
            message: "Like realizado com sucesso"
        }

        return response
    }

    public removeLike = async (input: IRemoveLikeInputDTO) => {

        const { token, postId } = input

        const isTokenValid = this.authenticator.getTokenPayload(token)

        if (!isTokenValid) {
            throw new AuthorizationError()
        }

        const postDB = await this.postDatabase.findById(postId)

        if (!postDB) {
            throw new NotFoundError()
        }

        const isAlreadyLiked = await this.postDatabase.findLike(
            postId,
            isTokenValid.id
        )

        if (!isAlreadyLiked) {
            throw new ConflictError()
        }

        await this.postDatabase.removeLike(postId, isTokenValid.id)

        const response: IRemoveLikeOutputDTO = {
            message: "Like removido com sucesso"
        }

        return response
    }
}