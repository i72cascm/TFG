namespace Backend.DTOs
{
    public class UserLoginDto
    {
        public required string UserOrEmail { get; set; }
        public required string Password { get; set; }
    }
}
