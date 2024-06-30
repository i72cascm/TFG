using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class Correciones : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "RecipeTags",
                columns: table => new
                {
                    RecipeTagID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TagName = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RecipeTags", x => x.RecipeTagID);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    UserID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Email = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LastNames = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UserName = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Password = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    BirthDate = table.Column<DateOnly>(type: "date", nullable: false),
                    Role = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Validate = table.Column<bool>(type: "bit", nullable: false),
                    ValidateToken = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ResetPasswordToken = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.UserID);
                });

            migrationBuilder.CreateTable(
                name: "Recipes",
                columns: table => new
                {
                    RecipeID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserID = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PreparationTime = table.Column<int>(type: "int", nullable: false),
                    ServingsNumber = table.Column<int>(type: "int", nullable: false),
                    RecipeImage = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Steps = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Ingredients = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RecipeTagID = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Recipes", x => x.RecipeID);
                    table.ForeignKey(
                        name: "FK_Recipes_RecipeTags_RecipeTagID",
                        column: x => x.RecipeTagID,
                        principalTable: "RecipeTags",
                        principalColumn: "RecipeTagID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Recipes_Users_UserID",
                        column: x => x.UserID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ShoppingLists",
                columns: table => new
                {
                    ShoppingListID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserID = table.Column<int>(type: "int", nullable: false),
                    ShoppingListName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Total = table.Column<float>(type: "real", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ShoppingLists", x => x.ShoppingListID);
                    table.ForeignKey(
                        name: "FK_ShoppingLists_Users_UserID",
                        column: x => x.UserID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
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

            migrationBuilder.CreateTable(
                name: "ProductLines",
                columns: table => new
                {
                    ProductLineID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ShoppingListID = table.Column<int>(type: "int", nullable: false),
                    Amount = table.Column<int>(type: "int", nullable: false),
                    Price = table.Column<float>(type: "real", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductLines", x => x.ProductLineID);
                    table.ForeignKey(
                        name: "FK_ProductLines_ShoppingLists_ShoppingListID",
                        column: x => x.ShoppingListID,
                        principalTable: "ShoppingLists",
                        principalColumn: "ShoppingListID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProductLines_ShoppingListID",
                table: "ProductLines",
                column: "ShoppingListID");

            migrationBuilder.CreateIndex(
                name: "IX_Recipes_RecipeTagID",
                table: "Recipes",
                column: "RecipeTagID");

            migrationBuilder.CreateIndex(
                name: "IX_Recipes_UserID",
                table: "Recipes",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_ShoppingLists_UserID",
                table: "ShoppingLists",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_UserName",
                table: "Users",
                column: "UserName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserTags_RecipeTagID",
                table: "UserTags",
                column: "RecipeTagID");

            migrationBuilder.CreateIndex(
                name: "IX_UserTags_UserID_RecipeTagID",
                table: "UserTags",
                columns: new[] { "UserID", "RecipeTagID" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ProductLines");

            migrationBuilder.DropTable(
                name: "Recipes");

            migrationBuilder.DropTable(
                name: "UserTags");

            migrationBuilder.DropTable(
                name: "ShoppingLists");

            migrationBuilder.DropTable(
                name: "RecipeTags");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
