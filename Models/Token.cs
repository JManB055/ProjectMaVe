namespace ProjectMaVe.Models
{
	/**
	* <summary>
	* Represents a token used to authenticate user
	* </summary>
	* <remarks>
	* Tokens are used to control user sign in and authentication activities
	* </remarks>
	*/
    public class Token
    {
        public string access_token { get; set; }
        public string refresh_token { get; set; }
        public string token_type { get; set; }
        public int expires_in { get; set; }
        public string scope { get; set; }
        public string user_id { get; set; }
    }
}
