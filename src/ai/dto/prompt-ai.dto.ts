/* eslint-disable prettier/prettier */
import { IsString, MinLength } from "class-validator";

export class PromptAiDto {
    @IsString()
    message: string;
}
