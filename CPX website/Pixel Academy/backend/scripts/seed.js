const { sequelize, Course, Module, Chapter } = require('../models');

async function seed() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Sync database (create tables)
    console.log('📊 Creating database tables...');
    await sequelize.sync({ force: true }); // This will drop existing tables and recreate them
    console.log('✓ Database tables created');

    // Create course
    const course = await Course.create({
      slug: 'design-technology-ai',
      title: 'Design, Technology & AI for Designers',
      description: 'Learn how design, technology, and AI intersect to create better products and experiences.',
      duration: 260, // total minutes
      difficulty: 'beginner',
      isPublished: true
    });

    console.log('✓ Course created');

    // Create modules
    const modules = await Module.bulkCreate([
      {
        courseId: course.id,
        slug: 'module-01',
        title: 'Introduction to Design Thinking',
        description: 'Understanding the fundamentals of design thinking and its application in modern product development.',
        duration: 45,
        order: 1,
        isPublished: true
      },
      {
        courseId: course.id,
        slug: 'module-02',
        title: 'Visual Design Fundamentals',
        description: 'Master the core principles of visual design: typography, color, and shape.',
        duration: 50,
        order: 2,
        isPublished: true
      },
      {
        courseId: course.id,
        slug: 'module-03',
        title: 'Understanding AI & Prompts',
        description: 'Learn how to effectively communicate with AI tools and leverage them in your design workflow.',
        duration: 60,
        order: 3,
        isPublished: true
      },
      {
        courseId: course.id,
        slug: 'module-04',
        title: 'Systems Thinking',
        description: 'Develop a holistic view of design problems and learn to design at scale.',
        duration: 55,
        order: 4,
        isPublished: true
      },
      {
        courseId: course.id,
        slug: 'module-05',
        title: 'Design in the Real World',
        description: 'Apply your knowledge to real-world scenarios and build a professional portfolio.',
        duration: 50,
        order: 5,
        isPublished: true
      }
    ]);

    console.log('✓ Modules created');

    // Create chapters for Module 01
    await Chapter.bulkCreate([
      {
        moduleId: modules[0].id,
        slug: 'chapter-01',
        title: 'What is Design Thinking?',
        content: 'Introduction to design thinking methodology...',
        duration: 15,
        order: 1,
        isPublished: true
      },
      {
        moduleId: modules[0].id,
        slug: 'chapter-02',
        title: 'The Design Process',
        content: 'Understanding the five stages of design thinking...',
        duration: 15,
        order: 2,
        isPublished: true
      },
      {
        moduleId: modules[0].id,
        slug: 'chapter-03',
        title: 'Empathy in Design',
        content: 'How to understand and empathize with users...',
        duration: 15,
        order: 3,
        isPublished: true
      }
    ]);

    // Create chapters for Module 02
    await Chapter.bulkCreate([
      {
        moduleId: modules[1].id,
        slug: 'chapter-01',
        title: 'FONT',
        content: 'Typography fundamentals and font selection...',
        duration: 15,
        order: 1,
        isPublished: true
      },
      {
        moduleId: modules[1].id,
        slug: 'chapter-02',
        title: 'COLOR',
        content: 'Color theory, psychology, and application...',
        duration: 20,
        order: 2,
        isPublished: true
      },
      {
        moduleId: modules[1].id,
        slug: 'chapter-03',
        title: 'SHAPE',
        content: 'Shape psychology and visual hierarchy...',
        duration: 15,
        order: 3,
        isPublished: true
      }
    ]);

    // Create chapters for Module 03
    await Chapter.bulkCreate([
      {
        moduleId: modules[2].id,
        slug: 'chapter-01',
        title: 'Introduction to AI Tools',
        content: 'Overview of AI tools available for designers...',
        duration: 20,
        order: 1,
        isPublished: true
      },
      {
        moduleId: modules[2].id,
        slug: 'chapter-02',
        title: 'Prompt Engineering',
        content: 'How to write effective prompts for AI...',
        duration: 20,
        order: 2,
        isPublished: true
      },
      {
        moduleId: modules[2].id,
        slug: 'chapter-03',
        title: 'AI in Design Workflow',
        content: 'Integrating AI tools into your daily work...',
        duration: 20,
        order: 3,
        isPublished: true
      }
    ]);

    // Create chapters for Module 04
    await Chapter.bulkCreate([
      {
        moduleId: modules[3].id,
        slug: 'chapter-01',
        title: 'What is Systems Thinking?',
        content: 'Introduction to systems thinking in design...',
        duration: 20,
        order: 1,
        isPublished: true
      },
      {
        moduleId: modules[3].id,
        slug: 'chapter-02',
        title: 'Design Systems',
        content: 'Creating and maintaining design systems...',
        duration: 20,
        order: 2,
        isPublished: true
      },
      {
        moduleId: modules[3].id,
        slug: 'chapter-03',
        title: 'Scaling Design',
        content: 'Designing for scale and consistency...',
        duration: 15,
        order: 3,
        isPublished: true
      }
    ]);

    // Create chapters for Module 05
    await Chapter.bulkCreate([
      {
        moduleId: modules[4].id,
        slug: 'chapter-01',
        title: 'Real-World Case Studies',
        content: 'Learn from successful design projects...',
        duration: 15,
        order: 1,
        isPublished: true
      },
      {
        moduleId: modules[4].id,
        slug: 'chapter-02',
        title: 'Building Your Portfolio',
        content: 'How to showcase your work effectively...',
        duration: 20,
        order: 2,
        isPublished: true
      },
      {
        moduleId: modules[4].id,
        slug: 'chapter-03',
        title: 'Next Steps',
        content: 'Continuing your design education...',
        duration: 15,
        order: 3,
        isPublished: true
      }
    ]);

    console.log('✓ Chapters created');
    console.log('🌱 Seeding completed successfully!');
    console.log(`\nCreated:`);
    console.log(`- 1 Course: ${course.title}`);
    console.log(`- 5 Modules`);
    console.log(`- 15 Chapters`);

  } catch (error) {
    console.error('✗ Seeding error:', error);
    throw error;
  }
}

// Run seeding
sequelize.authenticate()
  .then(() => {
    console.log('✓ Database connected');
    return seed();
  })
  .then(() => {
    console.log('\n✓ All done!');
    process.exit(0);
  })
  .catch(error => {
    console.error('✗ Error:', error);
    process.exit(1);
  });
