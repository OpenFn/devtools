create('trackedEntityInstances', {
  trackedEntityType: 'nEenWmSyUEp', // a person
  orgUnit: 'g8upMTyEZGZ', // Njandama MCHP
  attributes: [
    attr('w75KJ2mc4zz', dataValue('case.firstName')), // first name
    attr('zDhUuAYrxNC', dataValue('case.lastName')), // last name
  ],
  enrollments: [
    {
      orgUnit: 'g8upMTyEZGZ', // Njandama MCHP
      program: 'IpHINAT79UW', // enroll in Child Program
      enrollmentDate: new Date().toISOString().slice(0, 10), // some custom javascript
      incidentDate: state.data.metadata.timeStart.slice(0, 10), // more custom javascript
    },
  ],
});
