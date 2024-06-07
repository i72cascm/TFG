using Backend.Services;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace Backend.Filters
{
    public class ValidateTokenAttribute(IAuthService authService) : ActionFilterAttribute
    {
        private readonly IAuthService _authService = authService;

        public override void OnActionExecuting(ActionExecutingContext context)
        {
            var authToken = context.HttpContext.Request.Headers.Authorization.FirstOrDefault();

            if (string.IsNullOrEmpty(authToken))
            {
                context.Result = new BadRequestObjectResult(new { Message = "Authorization token is missing." });
                return;
            }

            try
            {
                var userPrincipal = _authService.ValidateToken(authToken);
                context.HttpContext.User = userPrincipal;
            }
            catch (SecurityTokenException)
            {
                context.Result = new UnauthorizedObjectResult(new { Message = "Invalid token." });
            }

            base.OnActionExecuting(context);
        }
    }
}