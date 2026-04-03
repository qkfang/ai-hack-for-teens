using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api.Migrations
{
    /// <inheritdoc />
    public partial class PendingModelChanges : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "AppSettings",
                keyColumn: "Key",
                keyValue: "nav-config",
                column: "Value",
                value: "{\"genai\":{\"chat\":false,\"translation\":false,\"speech\":false,\"realtime\":false},\"startup\":{\"ideas\":false,\"storybook\":false,\"comic\":false,\"agent\":false,\"webbuilder\":false},\"gallery\":true,\"quiz\":true}");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "AppSettings",
                keyColumn: "Key",
                keyValue: "nav-config",
                column: "Value",
                value: "{\"genai\":{\"chat\":false,\"translation\":false,\"speech\":false,\"realtime\":false},\"startup\":{\"ideas\":true,\"storybook\":false,\"comic\":false,\"agent\":false,\"webbuilder\":false},\"gallery\":false,\"quiz\":false}");
        }
    }
}
