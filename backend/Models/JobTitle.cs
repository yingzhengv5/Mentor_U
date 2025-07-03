using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class JobTitle
    {
        public JobTitle()
        {
            UserJobTitles = new List<UserJobTitle>();
        }

        [Key]
        public Guid Id { get; set; }

        [Required]
        public required string name { get; set; }

        // Navigation properties
        public virtual ICollection<UserJobTitle> UserJobTitles { get; set; }
    }
}