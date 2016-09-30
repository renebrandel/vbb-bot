export function stringifyDepartures (departures) {
  return departures.map(departure => `**${departure.name.trim()}** is leaving at **${departure.time}** to **${departure.direction}**`).join('<br/>')
}

export function getFirstStation (result) {
  return result.stopLocationOrCoordLocation[0].StopLocation
}

export function getTripsFromResult (result) {
  const answer = result.Trip[0].LegList.Leg
    .map((leg, index) => `${index + 1}. Take **${leg.Product.name.trim()}** in the direction ${leg.direction} to **${leg.Destination.name}**`)
    .join('<br/>')
  return answer.charAt(0).toUpperCase() + answer.slice(1)
}

export function getDeparturesFromResult (result) {
  return result.Departure.slice(0, 5)
}
