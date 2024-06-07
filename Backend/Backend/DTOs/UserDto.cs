namespace Backend.DTOs
{
    public class UserDto
    {
        public int ID { get; set; }
        public string Email { get; set; }
        public string Name { get; set; }
        public string LastNames { get; set; }
        public string UserName { get; set; }
        public string Password { get; set; }
        public DateOnly BirthDate { get; set; }

    }
}
