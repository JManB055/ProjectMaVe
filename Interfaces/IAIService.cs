namespace ProjectMaVe.Interfaces
{
    public interface IAIService
    {
        public Task<string> CallAIAsync(string prompt);
    }
}
