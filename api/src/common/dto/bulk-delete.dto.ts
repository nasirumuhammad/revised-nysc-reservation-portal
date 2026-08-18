import { ArrayMinSize, ArrayUnique, IsUUID } from 'class-validator';

export class BulkDeleteDto {
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsUUID('4', { each: true })
  ids!: string[];
}
