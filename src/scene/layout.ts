import * as THREE from "three";

/**
 * Spatial layout of the plaza and the scroll tour, in one place.
 * Camera waypoints and look targets are indexed by chapter.
 */

export const WANDER_RADIUS = 5.2;

export const ZONES = {
  name: new THREE.Vector3(0, 3.9, -3),
  about: new THREE.Vector3(-9, 2.3, -3),
  skills: new THREE.Vector3(8.5, 2.3, -2),
  contact: new THREE.Vector3(0, 2.1, -11),
};

/** Camera dolly waypoints — one per chapter, threaded by a CatmullRom curve. */
export const CAM_POINTS = [
  new THREE.Vector3(0, 5.6, 15.5), // arrival — wide establishing shot
  new THREE.Vector3(0, 1.7, 7.4), // among the Miis
  new THREE.Vector3(-4.9, 2.0, 1.6), // gliding to About
  new THREE.Vector3(4.4, 2.1, 2.4), // over to Skills
  new THREE.Vector3(0, 3.0, -3.6), // pulling up to Contact
];

/** What the camera looks at per chapter (lerped between neighbours). */
export const LOOK_TARGETS = [
  new THREE.Vector3(0, 2.0, -1),
  new THREE.Vector3(0, 0.9, 0),
  ZONES.about.clone(),
  ZONES.skills.clone(),
  ZONES.contact.clone(),
];

export const CHAPTER_COUNT = CAM_POINTS.length;

/** Scroll track length in viewport-heights. */
export const PAGES = 5.5;
