import { getFacultyById, getSortedFaculty } from '../../models/faculty/faculty.js';

const facultyListPage = (req, res) => {
    const sortBy = req.query.sort || 'name';
    const facultyList = getSortedFaculty(sortBy);

    res.render('faculty/list', {
        title: 'Faculty Directory',
        faculty: facultyList,
        currentSort: sortBy
    });
};

const facultyDetailPage = (req, res) => {
    const { facultyId } = req.params;
    const member = getFacultyById(facultyId);

    if (!member) {
        return res.status(404).render('404', {
            title: 'Faculty Not Found',
            message: `No faculty member found with ID: ${facultyId}`
        });
    }

    res.render('faculty/detail', {
        title: member.name,
        member
    });
};

export { facultyListPage, facultyDetailPage };