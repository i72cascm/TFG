using System.Security.Claims;
using Backend.Modelos;

namespace Backend.Services
{
    public interface IAuthService
    {
        string GenerateJwtToken(User user);
        ClaimsPrincipal ValidateToken(string token);
    }
}
