import { Type } from 'class-transformer';
import { Max, Min } from 'class-validator';

export class PaginationDto {
  @Type(() => Number)
  @Min(1)
  page: number = 1;

  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit: number = 10;
}
