namespace Backend.DTOs
{
    public class UserDto
    {
        public int ID { get; set; }
        public string? Email { get; set; }
        public required string Name { get; set; }
        public required string LastNames { get; set; }
        public required string UserName { get; set; }
        public string? Password { get; set; }
        public DateOnly BirthDate { get; set; }

    }
}
