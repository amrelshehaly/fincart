import { Controller } from '@nestjs/common';
import { FincartService } from './fincart.service';
@Controller('fincart')
export class FincartController {
  constructor(private readonly fincartService: FincartService) {}
}
