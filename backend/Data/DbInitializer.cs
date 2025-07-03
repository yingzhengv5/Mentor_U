using Microsoft.EntityFrameworkCore;
using backend.Models;

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
        }
    }
}