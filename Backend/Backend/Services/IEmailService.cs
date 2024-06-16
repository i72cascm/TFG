namespace Backend.Services
{
    public interface IEmailService
    {
        Task SendEmailValidateAccount(string email, string token);

        Task SendEmailResetPassword(string email, string token);        
    }
}
