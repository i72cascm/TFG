namespace Backend.DTOs
{
    public class UserInsertDto
    {
        public string Email { get; set; }
        public string Name { get; set; }
        public string LastNames { get; set; }
        public string UserName { get; set; }
        public string Password { get; set; }
        public DateOnly BirthDate { get; set; }
    }
}
