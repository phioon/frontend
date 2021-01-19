import React from "react";
import { PropagateLoader, RingLoader } from "react-spinners";

const colors = {
  primary: "#3a5966",
}

export function HorizontalLoader(props) {
  var size = undefined
  if (!props.size)
    props.size = "md"

  switch (props.size) {
    case "sm":
      size = 5
      break;
    case "md":
      size = 8
      break;
    case "lg":
      size = 15
      break;
  }

  return <PropagateLoader color={colors.primary} size={size} />
}

export function CircularLoader(props) {
  var size = undefined
  if (!props.size)
    props.size = "md"

  switch (props.size) {
    case "sm":
      size = 15
      break;
    case "md":
      size = 58
      break;
    case "lg":
      size = 67
      break;
  }

  return <RingLoader color={colors.primary} size={size} />
}