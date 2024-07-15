using Backend.Models;
using Microsoft.Extensions.Options;
using System.Net.Http;
using System.Threading.Tasks;
using System;
using System.Web;

namespace Backend.Services
{
    // Edamam Service class
    public class EdamamService
    {
        private readonly HttpClient _httpClient;
        private readonly EdamamOptions _options;

        public EdamamService(HttpClient httpClient, IOptions<EdamamOptions> options)
        {
            _httpClient = httpClient;
            _options = options.Value;
        }

        public async Task<string> GetRecipesAsync(string query, List<string> healthLabels = null, List<string> dietLabels = null)
        {
            var builder = new UriBuilder("https://api.edamam.com/search");
            var queryParams = HttpUtility.ParseQueryString(string.Empty);

            queryParams["q"] = query;
            queryParams["app_id"] = _options.AppId;
            queryParams["app_key"] = _options.AppKey;

            if (healthLabels != null)
            {
                foreach (var label in healthLabels)
                {
                    queryParams.Add("health", label);
                }
            }

            if (dietLabels != null)
            {
                foreach (var label in dietLabels)
                {
                    queryParams.Add("diet", label);
                }
            }


            builder.Query = queryParams.ToString();
            var requestUrl = builder.ToString();

            Console.WriteLine(requestUrl);

            var response = await _httpClient.GetAsync(requestUrl);
            response.EnsureSuccessStatusCode();

            return await response.Content.ReadAsStringAsync();
        }
    }
}
