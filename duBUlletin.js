const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const url = 'https://bulletin.du.edu/undergraduate/majorsminorscoursedescriptions/traditionalbachelorsprogrammajorandminors/computerscience/#coursedescriptionstext';
const outputFile = 'results/bulletin.json';

async function fetchCourses() {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const courses = [];

    $('.sc_sccoursedescs .courseblock').each((index, element) => {
      const courseBlock = $(element);
      const courseCode = courseBlock.find('.courseblocktitle').text().trim().split(' ')[0];
      const courseTitle = courseBlock.find('.courseblocktitle').text().trim().split(' ').slice(1).join(' ');
      const courseblockdesc = courseBlock.find('.courseblockdesc').text().trim();
    //   console.log(`Course Description: ${courseblockdesc}`);
    const courseNumber = parseInt(courseCode.match(/\d+/)[0], 10);


    if (courseNumber >= 3000 && !courseblockdesc.toLowerCase().includes('prerequisite')) {
        courses.push({ course: courseCode, title: courseTitle });
      }
    });


    return courses;
  } catch (error) {
    console.error('Error fetching courses:', error);
  }
}

fetchCourses().then(courses => {
  fs.writeFileSync(outputFile, JSON.stringify({ courses }, null, 2));
  console.log('Courses saved to', outputFile);
});