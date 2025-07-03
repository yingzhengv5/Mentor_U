using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class UserJobTitle
    {
        public Guid UserId { get; set; }
        public Guid JobTitleId { get; set; }

        [ForeignKey("UserId")]
        public required virtual User User { get; set; }

        [ForeignKey("JobTitleId")]
        public required virtual JobTitle JobTitle { get; set; }
    }
}