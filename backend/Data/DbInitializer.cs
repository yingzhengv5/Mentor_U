using Microsoft.EntityFrameworkCore;
using backend.Models;
using backend.Models.Enums;
using Microsoft.AspNetCore.Identity;

namespace backend.Data
{
    public static class DbInitializer
    {
        public static async Task Initialize(ApplicationDbContext context)
        {
            await context.Database.MigrateAsync();

            // Add Job Titles if they don't exist
            if (!await context.JobTitles.AnyAsync())
            {
                var jobTitles = new[]
                {
                    "Software Engineer",
                    "Frontend Developer",
                    "Backend Developer",
                    "Mobile Developer",
                    "Full Stack Developer",
                    "DevOps Engineer",
                    "Database Administrator",
                    "Security Analyst",
                    "Data Engineer",
                    "Cloud Engineer",
                    "IT Support",
                    "Business Analyst",
                    "UX Designer",
                    "Machine Learning Engineer",
                    "Cybersecurity Specialist",
                    "AI Engineer",
                    "Data Analyst",
                    "Software Tester"
                };

                foreach (var title in jobTitles)
                {
                    context.JobTitles.Add(new JobTitle { name = title });
                }
                await context.SaveChangesAsync();
            }

            // Add Skills if they don't exist
            if (!await context.Skills.AnyAsync())
            {
                var skills = new[]
                {
                    "Java",
                    "Python",
                    "C#",
                    "JavaScript",
                    "TypeScript",
                    "SQL",
                    "Go",
                    "R",
                    "Rust",
                    "Kotlin",
                    "Swift",
                    "HTML",
                    "CSS",
                    "React",
                    "Angular",
                    "Vue",
                    "Next.js",
                    "Tailwind CSS",
                    "Bootstrap",
                    "Node.js",
                    ".NET",
                    "Spring Boot",
                    "Django",
                    "Flask",
                    "Laravel",
                    "GraphQL",
                    "RESTful API",
                    "PostgreSQL",
                    "MySQL",
                    "MongoDB",
                    "SQL Server",
                    "Oracle",
                    "Firebase",
                    "Cosmos DB",
                    "AWS",
                    "Azure",
                    "Google Cloud",
                    "Docker",
                    "Kubernetes",
                    "Terraform",
                    "CI/CD",
                    "Jenkins",
                    "GitHub Actions",
                    "Machine Learning",
                    "TensorFlow",
                    "PyTorch",
                    "Pandas",
                    "NumPy",
                    "Tableau",
                    "Power BI",
                    "Selenium",
                    "Cypress",
                    "JUnit",
                    "NUnit",
                    "Postman",
                    "JMeter",
                    "Agile",
                    "Scrum",
                    "Kanban",
                    "Jira"
                };

                foreach (var skillName in skills)
                {
                    context.Skills.Add(new Skill { name = skillName });
                }
                await context.SaveChangesAsync();
            }

            // Add test users if they don't exist
            if (!await context.Users.AnyAsync())
            {
                var passwordHasher = new PasswordHasher<User>();
                var jobTitles = await context.JobTitles.ToListAsync();
                var skills = await context.Skills.ToListAsync();
                var random = new Random();

                // Create 20 students
                for (int i = 1; i <= 20; i++)
                {
                    var student = new User
                    {
                        Email = $"student{i}@test.com",
                        Password = passwordHasher.HashPassword(null!, "123"),
                        FirstName = $"Student{i}",
                        LastName = $"Test",
                        Role = UserRole.Student,
                        Bio = $"I am student {i}, eager to learn and grow in tech!",
                    };

                    context.Users.Add(student);
                    await context.SaveChangesAsync();

                    // Add random desired job title
                    var desiredJobTitle = jobTitles[random.Next(jobTitles.Count)];
                    var userJobTitle = new UserJobTitle
                    {
                        UserId = student.Id,
                        JobTitleId = desiredJobTitle.Id,
                        User = student,
                        JobTitle = desiredJobTitle
                    };
                    context.UserJobTitles.Add(userJobTitle);

                    // Add 3-5 willing to learn skills
                    var shuffledSkills = skills.OrderBy(x => random.Next()).ToList();
                    var skillCount = random.Next(3, 6);
                    for (int j = 0; j < skillCount; j++)
                    {
                        var skill = shuffledSkills[j];
                        var userWillingToLearnSkill = new UserWillingToLearnSkill
                        {
                            UserId = student.Id,
                            SkillId = skill.Id,
                            User = student,
                            Skill = skill
                        };
                        context.UserWillingToLearnSkills.Add(userWillingToLearnSkill);
                    }
                }

                // Create 20 mentors
                for (int i = 1; i <= 20; i++)
                {
                    var mentor = new User
                    {
                        Email = $"mentor{i}@test.com",
                        Password = passwordHasher.HashPassword(null!, "123"),
                        FirstName = $"Mentor{i}",
                        LastName = $"Expert",
                        Role = UserRole.Mentor,
                        Bio = $"I am mentor {i}, with extensive experience in software development.",
                    };

                    context.Users.Add(mentor);
                    await context.SaveChangesAsync();

                    // Add current job title
                    var currentJobTitle = jobTitles[random.Next(jobTitles.Count)];
                    var userJobTitle = new UserJobTitle
                    {
                        UserId = mentor.Id,
                        JobTitleId = currentJobTitle.Id,
                        User = mentor,
                        JobTitle = currentJobTitle
                    };
                    context.UserJobTitles.Add(userJobTitle);

                    // Add 4-7 skills
                    var shuffledSkills = skills.OrderBy(x => random.Next()).ToList();
                    var skillCount = random.Next(4, 8);
                    for (int j = 0; j < skillCount; j++)
                    {
                        var skill = shuffledSkills[j];
                        var userSkill = new UserSkill
                        {
                            UserId = mentor.Id,
                            SkillId = skill.Id,
                            User = mentor,
                            Skill = skill
                        };
                        context.UserSkills.Add(userSkill);
                    }
                }

                await context.SaveChangesAsync();

                // Create 7 groups
                var students = await context.Users.Where(u => u.Role == UserRole.Student).ToListAsync();
                var groupNames = new[] {
                    "Web Development Study Group",
                    "Machine Learning Enthusiasts",
                    "Cloud Computing Club",
                    "Mobile App Developers",
                    "Data Science Group",
                    "DevOps Practice",
                    "Cybersecurity Team"
                };

                for (int i = 0; i < 7; i++)
                {
                    var creator = students[random.Next(students.Count)];
                    var group = new Group
                    {
                        Name = groupNames[i],
                        Description = $"A group for {groupNames[i].ToLower()} learning and collaboration.",
                        CreatorId = creator.Id,
                        CreatedAt = DateTime.UtcNow,
                        Creator = creator
                    };

                    context.Groups.Add(group);
                    await context.SaveChangesAsync();

                    // Add creator as member
                    var creatorMember = new GroupMember
                    {
                        GroupId = group.Id,
                        UserId = creator.Id,
                        Status = RequestStatus.Accepted,
                        Group = group,
                        User = creator
                    };
                    context.GroupMembers.Add(creatorMember);

                    // For first 5 groups, add 1-2 more members
                    if (i < 5)
                    {
                        var memberCount = random.Next(1, 3);
                        var potentialMembers = students.Where(s => s.Id != creator.Id).OrderBy(x => random.Next()).Take(memberCount);

                        foreach (var member in potentialMembers)
                        {
                            var groupMember = new GroupMember
                            {
                                GroupId = group.Id,
                                UserId = member.Id,
                                Status = RequestStatus.Accepted,
                                Group = group,
                                User = member
                            };
                            context.GroupMembers.Add(groupMember);
                        }
                    }
                }

                await context.SaveChangesAsync();
            }
        }
    }
}