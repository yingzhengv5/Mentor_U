using System.ComponentModel.DataAnnotations.Schema;
using backend.Models.Enums;

namespace backend.Models
{
	public class GroupMember
	{
		public Guid GroupId { get; set; }
		public Guid UserId { get; set; }
		public RequestStatus Status { get; set; }

		// Navigation properties
		[ForeignKey("GroupId")]
		public virtual required Group Group { get; set; }

		[ForeignKey("UserId")]
		public virtual required User User { get; set; }
	}
}

