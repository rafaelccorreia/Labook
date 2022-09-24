import { Request, Response } from "express";
import { PostBusiness } from "../business/PostBusiness";
import { IAddLikeInputDTO, ICreatePostInputDTO, IDeletePostInputDTO, IGetPostsInputDTO, IRemoveLikeInputDTO } from "../models/Post";

export class PostController {
    constructor(
        private postBusiness: PostBusiness
    ) {}
    
    public createPost = async (req: Request, res: Response) => {
        try {
            const  token  = req.headers.authorization as string
            const { content } = req.body

            const input: ICreatePostInputDTO = {
                token,
                content
            }

            const response = await this.postBusiness.createPost(input)

            res.status(201).send(response)
        } catch (error: any) {
            res.status( error.statusCode || 500).send({ message: error.message || error.sqlMessage })
        }
    }

    public getPosts = async (req: Request, res: Response) => {
        try {
            const token = req.headers.authorization as string

            const input: IGetPostsInputDTO = {
                token
            }

            const response = await this.postBusiness.getPosts(token)

            res.status(200).send(response)
        } catch (error: any) {
            res.status(error.statusCode || 500).send({ message: error.message || error.sqlMessage })
        }
    }

    public deletePost = async (req: Request, res: Response) => {
        try {
            const input: IDeletePostInputDTO = {
                token: req.headers.authorization as string,
                postId: req.params.id
            }

            const response = await this.postBusiness.deletePost(input)

            res.status(200).send(response)

        } catch (error: any) {
            res.status(error.statusCode || 500).send({ message: error.message || error.sqlMessage })
        }
    }

    public addLike = async (req: Request, res: Response) => {
        try {

            const input: IAddLikeInputDTO = {
                token: req.headers.authorization as string,
                postId: req.params.id
            }

            const response = await this.postBusiness.addLike(input)

            res.status(200).send(response)

        } catch (error: any) {
            res.status(error.statusCode).send({ message: error.message || error.sqlMessage })
        }
    }

    public removeLike = async (req: Request, res: Response) => {
        try {

            const input: IRemoveLikeInputDTO = {
                token: req.headers.authorization as string,
                postId: req.params.id
            }

            const response = await this.postBusiness.removeLike(input)

            res.status(200).send(response)

        } catch (error: any) {
            res.status(error.statusCode).send({ message: error.message || error.sqlMessage })
        }
    }
}