import { ParticipantStatusTypes } from "./types";

export const translateParticipantStatus = (status: ParticipantStatusTypes   ) => {
  switch (status) {
    case ParticipantStatusTypes.ATTENDED:
      return "Presente";
    case ParticipantStatusTypes.ABSENT:
      return "Ausente";
    case ParticipantStatusTypes.LATE:
      return "Tarde";
    case ParticipantStatusTypes.REGISTERED:
      return "Registrado";
    default:
      return "Desconocido";
  }
};
