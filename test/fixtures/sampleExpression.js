get('https://www.example.com', {});
alterState(state => {
  console.log('Test complete.');
  return state;
});
