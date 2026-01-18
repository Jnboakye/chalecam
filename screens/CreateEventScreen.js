import React, { useEffect } from 'react';

const CreateEventScreen = ({ navigation }) => {
  useEffect(() => {
    // Navigate to the first step of event creation
    navigation.navigate('EventName', { eventData: {} });
  }, [navigation]);

  return null;
};

export default CreateEventScreen;

