namespace Backend.DTOs
{
    public class UserUpdateDto
    {
        public string Name { get; set; }
        public string LastNames { get; set; }
        public string UserName { get; set; }
        public DateOnly BirthDate { get; set; }
    }
}
