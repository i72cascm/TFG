using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class RecipeTags : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Tag",
                table: "Recipes");

            migrationBuilder.AddColumn<int>(
                name: "RecipeTagID",
                table: "Recipes",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "RecipeTags",
                columns: table => new
                {
                    RecipeTagID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RecipeTags", x => x.RecipeTagID);
                });

            migrationBuilder.CreateTable(
                name: "UserTags",
                columns: table => new
                {
                    UserTagID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserID = table.Column<int>(type: "int", nullable: false),
                    RecipeTagID = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserTags", x => x.UserTagID);
                    table.ForeignKey(
                        name: "FK_UserTags_RecipeTags_RecipeTagID",
                        column: x => x.RecipeTagID,
                        principalTable: "RecipeTags",
                        principalColumn: "RecipeTagID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserTags_Users_UserID",
                        column: x => x.UserID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Recipes_RecipeTagID",
                table: "Recipes",
                column: "RecipeTagID");

            migrationBuilder.CreateIndex(
                name: "IX_UserTags_RecipeTagID",
                table: "UserTags",
                column: "RecipeTagID");

            migrationBuilder.CreateIndex(
                name: "IX_UserTags_UserID_RecipeTagID",
                table: "UserTags",
                columns: new[] { "UserID", "RecipeTagID" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Recipes_RecipeTags_RecipeTagID",
                table: "Recipes",
                column: "RecipeTagID",
                principalTable: "RecipeTags",
                principalColumn: "RecipeTagID",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Recipes_RecipeTags_RecipeTagID",
                table: "Recipes");

            migrationBuilder.DropTable(
                name: "UserTags");

            migrationBuilder.DropTable(
                name: "RecipeTags");

            migrationBuilder.DropIndex(
                name: "IX_Recipes_RecipeTagID",
                table: "Recipes");

            migrationBuilder.DropColumn(
                name: "RecipeTagID",
                table: "Recipes");

            migrationBuilder.AddColumn<string>(
                name: "Tag",
                table: "Recipes",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }
    }
}
