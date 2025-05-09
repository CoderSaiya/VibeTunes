using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VibeTunes.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class FixDeleteBehaviorSong : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Histories_Songs_SongId",
                table: "Histories");

            migrationBuilder.AddForeignKey(
                name: "FK_Histories_Songs_SongId",
                table: "Histories",
                column: "SongId",
                principalTable: "Songs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Histories_Songs_SongId",
                table: "Histories");

            migrationBuilder.AddForeignKey(
                name: "FK_Histories_Songs_SongId",
                table: "Histories",
                column: "SongId",
                principalTable: "Songs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
