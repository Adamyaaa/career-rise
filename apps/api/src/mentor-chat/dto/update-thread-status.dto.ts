import { IsIn } from "class-validator";

export class UpdateThreadStatusDto {
  @IsIn(["open", "resolved"])
  status: "open" | "resolved";
}
