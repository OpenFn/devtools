createTEI({
  trackedEntityType: 'nEenWmSyUEp', // a person
  orgUnit: 'g8upMTyEZGZ', // Njandama MCHP
  attributes: [
    {
      attribute: 'w75KJ2mc4zz', // attribute id for first name
      value: dataValue('case.firstName')(state), // data from submission
    },
    {
      attribute: 'zDhUuAYrxNC', // attribute id for last name
      value: dataValue('case.lastName')(state), // data from another submission field
    },
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
