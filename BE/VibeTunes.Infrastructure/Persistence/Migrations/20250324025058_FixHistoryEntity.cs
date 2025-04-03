using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VibeTunes.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class FixHistoryEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<float>(
                name: "ListenDuration",
                table: "Histories",
                type: "real",
                nullable: false,
                defaultValue: 0f);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ListenDuration",
                table: "Histories");
        }
    }
}
