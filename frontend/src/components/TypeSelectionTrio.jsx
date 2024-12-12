import React from "react";
import styles from "../styles/components/TypeSelectionTrio.module.css";

const TypeSelectionTrio = ({
  setShowType,
  haveFairButton = true,
  haveSchoolTourButton = true,
  haveIndividualTourButton = true,
  upperCase = true,
  showType,
  buttonNames = ["Individual tours", "School tours", "Fairs"],
}) => {
  return (
    <div className={styles.typeSelectionTrio}>
      {haveIndividualTourButton && (
        <button
          onClick={() => setShowType("IndividualTour")}
          className={`${styles.button} ${
            showType === "IndividualTour" ? styles.active : ""
          }`}
        >
          {upperCase ? buttonNames[0].toUpperCase() : buttonNames[0]}
        </button>
      )}
      {haveSchoolTourButton && (
        <button
          onClick={() => setShowType("SchoolTour")}
          className={`${styles.button} ${
            showType === "SchoolTour" ? styles.active : ""
          }`}
        >
          {upperCase ? buttonNames[1].toUpperCase() : buttonNames[1]}
        </button>
      )}
      {haveFairButton && (
        <button
          onClick={() => setShowType("Fair")}
          className={`${styles.button} ${
            showType === "Fair" ? styles.active : ""
          }`}
        >
            {upperCase ? buttonNames[2].toUpperCase() : buttonNames[2]}
        </button>
      )}
    </div>
  );
};

export default TypeSelectionTrio;
