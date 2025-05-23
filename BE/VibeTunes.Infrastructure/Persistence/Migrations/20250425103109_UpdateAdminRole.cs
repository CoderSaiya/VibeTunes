﻿using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VibeTunes.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class UpdateAdminRole : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Following",
                table: "Users");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "Following",
                table: "Users",
                type: "float",
                nullable: false,
                defaultValue: 0.0);
        }
    }
}
