namespace Backend.DTOs
{
    public class UserInsertDto
    {
        public required string Email { get; set; }
        public required string Name { get; set; }
        public required string LastNames { get; set; }
        public required string UserName { get; set; }
        public required string Password { get; set; }
        public DateOnly BirthDate { get; set; }
    }
}
