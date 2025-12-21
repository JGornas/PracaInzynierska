using PhishApp.WebApi.Models.Recipients;
using PhishApp.WebApi.Models.SendingProfiles;

namespace PhishApp.WebApi.Models.RestApi.Quizzes
{
    public class SendQuizzRequestInfo
    {
        public int Id { get; set; }
        public int QuizzId { get; set; }    
        public int TemplateId { get; set; }    
        public int SendingProfileId { get; set; }
        public List<int> RecipientGroupIds { get; set; } = new();
    }
}
