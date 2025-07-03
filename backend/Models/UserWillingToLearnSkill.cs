using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class UserWillingToLearnSkill
    {
        public Guid UserId { get; set; }
        public Guid SkillId { get; set; }

        [ForeignKey("UserId")]
        public required virtual User User { get; set; }

        [ForeignKey("SkillId")]
        public required virtual Skill Skill { get; set; }
    }
}