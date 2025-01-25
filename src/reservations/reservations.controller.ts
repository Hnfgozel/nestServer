import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/enums/user-role.enum';
import { ReservationsService } from './reservations.service';

@Controller('reservations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async getReservations(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 5,
  ) {
    return this.reservationsService.getReservations(page, limit);
  }

  @Get('with-customers')
  @Roles(UserRole.ADMIN)
  async getReservationsWithCustomers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 5,
  ) {
    return this.reservationsService.getReservationsWithCustomers(page, limit);
  }
} 