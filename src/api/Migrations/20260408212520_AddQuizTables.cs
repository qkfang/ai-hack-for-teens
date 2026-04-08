using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace api.Migrations
{
    /// <inheritdoc />
    public partial class AddQuizTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "QuizAnswers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EventName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    QuestionId = table.Column<int>(type: "int", nullable: false),
                    AnswerIndex = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuizAnswers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "QuizEventStates",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EventName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    CurrentQuestion = table.Column<int>(type: "int", nullable: false),
                    ShowAnswer = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuizEventStates", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "QuizQuestions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Text = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OptionsJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CorrectIndex = table.Column<int>(type: "int", nullable: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuizQuestions", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "QuizQuestions",
                columns: new[] { "Id", "CorrectIndex", "DisplayOrder", "OptionsJson", "Text" },
                values: new object[,]
                {
                    { 1, 1, 0, "[\"Automated Intelligence\",\"Artificial Intelligence\",\"Advanced Integration\",\"Applied Information\"]", "What does AI stand for?" },
                    { 2, 2, 1, "[\"Siri\",\"Alexa\",\"Copilot\",\"Bixby\"]", "Which Microsoft AI assistant is built into Windows 11 and Microsoft 365?" },
                    { 3, 1, 2, "[\"A very big dictionary\",\"An AI trained on text to understand and generate language\",\"A programming language for AI\",\"A type of database\"]", "What is a Large Language Model (LLM)?" },
                    { 4, 1, 3, "[\"Speed\",\"Fairness\",\"Profitability\",\"Complexity\"]", "Which of the following is one of Microsoft's 6 Responsible AI principles?" },
                    { 5, 1, 4, "[\"Building hardware for AI chips\",\"Designing prompts to get better AI outputs\",\"Writing AI source code\",\"Training neural networks\"]", "What is 'prompt engineering'?" },
                    { 6, 2, 5, "[\"Reliability\",\"Privacy\",\"Fairness\",\"Accountability\"]", "In Microsoft's Responsible AI framework, which principle means AI should not disadvantage people based on race, gender, or other factors?" },
                    { 7, 0, 6, "[\"A cloud platform for building and deploying AI models and applications\",\"A robot manufacturing facility\",\"A Microsoft gaming service\",\"A programming language\"]", "What is Microsoft Foundry?" },
                    { 8, 1, 7, "[\"AI that prefers certain programming languages\",\"When AI produces unfair or skewed results due to flawed training data\",\"The speed difference between AI models\",\"AI that only works in one country\"]", "What does 'AI bias' mean?" },
                    { 9, 1, 8, "[\"Transparency\",\"Human oversight and control (Accountability)\",\"Inclusiveness\",\"Reliability\"]", "Which Microsoft Responsible AI principle ensures humans remain in control of AI decisions?" },
                    { 10, 1, 9, "[\"Teaching robots to walk\",\"A type of AI where systems learn patterns from data without being explicitly programmed\",\"Writing code that runs very fast\",\"A Microsoft Office feature\"]", "What is 'machine learning'?" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_QuizAnswers_EventName_UserId_QuestionId",
                table: "QuizAnswers",
                columns: new[] { "EventName", "UserId", "QuestionId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_QuizEventStates_EventName",
                table: "QuizEventStates",
                column: "EventName",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "QuizAnswers");

            migrationBuilder.DropTable(
                name: "QuizEventStates");

            migrationBuilder.DropTable(
                name: "QuizQuestions");
        }
    }
}
