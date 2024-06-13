using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Backend.DTOs;
using Backend.Modelos;
using Backend.Models;
using Backend.Validators;
using FluentValidation;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Configuration;
using Backend.Services;
using Backend.Filters;

namespace Backend.Controllers
{
    [ServiceFilter(typeof(ValidateTokenAttribute))]
    [Route("api/[controller]")]
    [ApiController]
    public class UserController(DBContext userContext) : ControllerBase
    {
        private readonly DBContext _userContext = userContext; // Contexto de la base de datos
        
        // Obtener todos los usuarios de la base de datos
        [HttpGet]
        public async Task<IEnumerable<UserDto>> Get() =>
            await _userContext.Users.Select(b => new UserDto
            {
                ID = b.UserID,
                Email = b.Email,
                Name = b.Name,
                LastNames = b.LastNames,
                UserName = b.UserName,
                Password = b.Password,
                BirthDate = b.BirthDate
            }).ToListAsync();


        // Obtener un único usuario a partir de su ID
        [HttpGet("{id}")]
        public async Task<ActionResult<UserDto>> GetById(int id)
        {
            var user = await _userContext.Users.FindAsync(id);

            if (user == null)
            {
                return NotFound();
            }

            var userDto = new UserDto
            {
                ID = user.UserID,
                Email = user.Email,
                Name = user.Name,
                LastNames = user.LastNames,
                UserName = user.UserName,
                Password = user.Password,
                BirthDate = user.BirthDate
            };

            return Ok(userDto);
        }

        // Modificar un usuario
        [HttpPut("{id}")]
        public async Task<ActionResult<UserDto>> Update(int id, UserUpdateDto userUpdateDto)
        {
            var user = await _userContext.Users.FindAsync(id);

            if (user == null)
            {
                return NotFound();
            }

            user.Email = userUpdateDto.Email;
            user.Name = userUpdateDto.Name;
            user.LastNames = userUpdateDto.LastNames;
            user.UserName = userUpdateDto.UserName;
            user.Password = userUpdateDto.Password;
            user.BirthDate = userUpdateDto.BirthDate;

            await _userContext.SaveChangesAsync(); // Guardar datos en la BD (no se añade al entity framework porque ya ha sido cargado previamente mediante FindAsync)

            var userDto = new UserDto
            {
                ID = user.UserID,
                Email = user.Email,
                Name = user.Name,
                LastNames = user.LastNames,
                UserName = user.UserName,
                Password = user.Password,
                BirthDate = user.BirthDate
            };

            return Ok(userDto);
        }

        // Eliminar un usuario
        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            var user = await _userContext.Users.FindAsync(id);

            if (user == null)
            {
                return NotFound();
            }

            _userContext.Users.Remove(user);
            await _userContext.SaveChangesAsync();

            return NoContent();
        }
    }
}
