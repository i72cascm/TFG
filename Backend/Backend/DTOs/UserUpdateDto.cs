namespace Backend.DTOs
{
    public class UserUpdateDto
    {
        public required string Name { get; set; }
        public required string LastNames { get; set; }
        public required string UserName { get; set; }
        public DateOnly BirthDate { get; set; }
    }
}
