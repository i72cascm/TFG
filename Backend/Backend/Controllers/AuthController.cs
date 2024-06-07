using Backend.DTOs;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;


namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController(DBContext userContext, IAuthService authService) : ControllerBase
    {
        private readonly DBContext _userContext = userContext;
        private readonly IAuthService _authService = authService;
        // Login Usuario
        [HttpPost("login")]
        public async Task<ActionResult> Login(UserLoginDto userLoginDto)
        {
            var user = await _userContext.Users.FirstOrDefaultAsync(u => u.Email == userLoginDto.UserOrEmail || u.UserName == userLoginDto.UserOrEmail);

            if (user == null)
            {
                return Unauthorized(new { message = "Error in login. Please check the credentials or create an account." });
            }

            // Verificar la contraseña ingrsada contra el hash almacenado
            bool validPassword = BCrypt.Net.BCrypt.Verify(userLoginDto.Password, user.Password);
            if (!validPassword)
            {
                // Si la contraseña no coincide, también se retorna un error de autorización.
                return Unauthorized(new { message = "Error in login. Please check the credentials or create an account." });
            }


            var token = _authService.GenerateJwtToken(user);
            return Ok(new { token, userName = user.UserName, id = user.UserID, email = user.Email });
        }
    }
}
