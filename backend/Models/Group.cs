using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.RegularExpressions;

namespace backend.Models
{
	public class Group
	{
		public Group()
		{
			Members = new List<GroupMember>();
		}
		[Key]
		public Guid Id { get; set; }

		[Required]
		public required string Name { get; set; }

		public required string Description { get; set; }

		[Required]
		public Guid CreatorId { get; set; }

		[Required]
		public DateTime CreatedAt { get; set; }

		// Navigation properties
		[ForeignKey("CreatorId")]
		public virtual required User Creator { get; set; }
		public virtual ICollection<GroupMember> Members { get; set; }
	}
}