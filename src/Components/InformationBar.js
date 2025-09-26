import React from "react";

export default function InformationDivBar({ planetInfo }) {
  if (!planetInfo) {
    return <div className="informationDivBar">Click on a planet to see its information.</div>;
  }

  return (
    <div className="informationDivBar">
      <h4>These information are from NASA Data Archive</h4>
      <div className="AllInformations">
        <div style={{ marginLeft: '10px' }} className="f1stcolumn">
          <span className="colored">Planet Name : </span> {planetInfo.pl_name}
          <br />
          <span className="colored">Host Name : </span>{planetInfo.hostname}
          <br />
          <span className="colored">Discovery Year : </span>{planetInfo.disc_year}
          <br />
          <span className="colored">Discovery Method : </span>{planetInfo.discoverymethod}
          <br />
          <span className="colored">SNR Value : </span>{planetInfo.snr_value}
          <br />
          <span className="colored">Is in Habitable Zone? : </span>{planetInfo.in_habitable_zone ? 'Yes' : 'No'}
          <br/>
          <span className="colored">Does it can be separated? :</span>{planetInfo.can_separate ? 'Yes' : 'No'}
          <br/>
          <span className="colored">Does it have Suitable Mass? : </span>{planetInfo.suitable_mass ? 'Yes' : 'No'} 
        </div>
        <div className="s2ndcolumn">
          <span className="colored">Orbital Period : </span>{planetInfo.pl_orbper} Year
          <br />
          <span className="colored">Orbit Semi-Major Axis : </span>{planetInfo.pl_orbsmax} au
          <br />
          <span className="colored">Planet Radius : </span>{planetInfo.pl_rade} Earth Radius
          <br />
          <span className="colored">Planet Mass : </span>{planetInfo.pl_bmasse} Earth mass
          <br/>
          <span className="colored">Does it have Potential Magnetic Field? : </span>{planetInfo.potential_magnetic_field ? 'Yes' : 'No'}
          <br/>
          <span className="colored">Does it have Suitable Temperature? : </span>{planetInfo.suitable_temp ? 'Yes' : 'No'}
          <br/>
          <span className="colored">Does it have Suitable Radius? : </span>{planetInfo.suitable_radius ? 'Yes' : 'No'} 
        </div>
      </div>
    </div>
  );
}
