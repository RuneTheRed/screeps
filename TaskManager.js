// Task Manager

//pass Game.spawns['Spawn1'].room
class Job {
	constructor(location,type,target,headCount) {
		this.id = location.x + '.' + location.y + '.' + type;
		this.location = location;
		this.type = type;
		this.target = target;
		this.headCount = headCount;
	}
	getId() {
		return this.id;
	}
	getLocation() {
		return this.location;
	}
	getType() {
		return this.type;
	}
	getTarget() {
		return this.target;
	}
	getHeadcount() {
		return this.headCount;
	}
}

class TaskManager {
	constructor(room) {
		this.room = room;
		this.jobs = new Map();
	}

	createJobs() {
		const sourceLocations = this.room.find(FIND_SOURCES);

		// Create mining jobs
		for (const source of sourceLocations) {
			const sourceAreas = this.room.lookForAtArea(LOOK_TERRAIN, source.pos.y-1, source.pos.x-1, source.pos.y+1, source.pos.x+1, true);
			for (const terrain of sourceAreas) {
			    if (terrain.terrain=='plain') {
			    	const tempJob = new Job(this.room.getPositionAt(terrain.x, terrain.y), 'mine', source, 1);
			    	this.jobs.set(tempJob.getId(), tempJob);
			    }
			}
		}

		// Create fetch jobs
		const spawnLocations = this.room.find(FIND_MY_SPAWNS);
		for (const spawn of spawnLocations) {
			const spawnAreas = this.room.lookForAtArea(LOOK_TERRAIN, spawn.pos.y-1, spawn.pos.x-1, spawn.pos.y+1, spawn.pos.x+1, true);
			const jobDemand = 2;
			let jobCount = 0;
			for (const terrain of spawnAreas) {
			    if (terrain.terrain=='plain' && jobCount < jobDemand) {
			    	jobCount++;
			    	const tempJob = new Job(this.room.getPositionAt(terrain.x, terrain.y), 'fetch', spawn, 1);
			    	this.jobs.set(tempJob.getId(), tempJob);
			    }
			}
		}

		for(const [key,val] of this.jobs) {
			switch (val.getType()) {
				case 'mine':
					this.room.visual.circle(val.getLocation(), {radius: .5,});
					break;
				case 'fetch':
					this.room.visual.circle(val.getLocation(), {radius: .5, fill: "#FF0000"});
					break;
			}
		}

	}

	getAllJobs() {
		return this.jobs;
	}
}

module.exports = TaskManager;