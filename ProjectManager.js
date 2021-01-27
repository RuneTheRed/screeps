//Project Manager

class ProjectManager {
	constructor(room, jobs) {
		this.room = room;
		this.jobs = jobs;
		this.memory = JSON.parse(RawMemory.get(), this.reviver);
		if (!this.memory.contractMemory) {
			this.memory.contractMemory = new Map().set(room.name, new Map());
		}
		this.contracts = this.memory.contractMemory.get(room.name) ? this.memory.contractMemory.get(room.name) : new Map();
		
		// Flag all jobs to be garbage collected, then we will reverse this flag if the job is still active
		for (const contract of this.contracts) {
			contract.garbageCollect = true;
		}

		// Make sure all new jobs are added to the contracts
		for (const [key, val] of this.jobs) {
			const contract = this.contracts.get(key);
			// Define a new contract if it doesn't exist
			if (!contract) {
				this.contracts.set(val.getId(), {workers: [], type: val.getType(), garbageCollect: false});
			} else {
				// Clear out any dead workers from the contract
				for (let i = 0; i < contract.workers.length; i++) {
					if (!Game.creeps[contract.workers[i]]) {
						contract.workers.splice[i, 1];
					}
				}
				// Keep garbage collection from collecting an active contract
				contract.garbageCollect = false;
			}
		}

		// Garbage collect contracts for jobs that no longer exist. 
		// Any creeps assigned to that contract are set to the 'idle' contract
		for(const [key, val] of this.contracts) {
			if (this.contracts.get(key).garbageCollect) {
				for (const worker of val.workers) {
					this.memory.creeps[worker].contract = 'idle';
				}
				this.contracts.delete(key)
			}
		}

		// Find workers for contracts with available room.
		for (const [key, val] of this.contracts) {
			if (this.jobs.get(key).getHeadcount() > this.contracts.get(key).workers.length) {
				switch (this.contracts.get(key).type) {
					case "mine":
					    const tempMiner = this.getIdle('miner');
						if (tempMiner) {
							this.contracts.get(key).workers.push(tempMiner);
							this.memory.creeps[tempMiner.name].contract = key;
						}
						break;
					case "fetch":
						const tempTransport = this.getIdle('transport');
						if (tempTransport) {
							this.contracts.get(key).workers.push(tempTransport);
							this.memory.creeps[tempTransport.name].contract = key;
						}
				}
			}
		}

		// Update actual game memory
 		RawMemory.set(JSON.stringify(this.memory, this.replacer))
	}

	getIdle(role) {
		return _.find(this.room.find(FIND_CREEPS), (creep) => {
			return (this.memory.creeps[creep.name].role == role && this.memory.creeps[creep.name].contract == 'idle');
		});
	}

	
	replacer(key, value) {
	  const originalObject = this[key];
	  if(originalObject instanceof Map) {
	    return {
	      dataType: 'Map',
	      value: Array.from(originalObject.entries()), // or with spread: value: [...originalObject]
	    };
	  } else {
	    return value;
	  }
	}

	reviver(key, value) {
	  if(typeof value === 'object' && value !== null) {
	    if (value.dataType === 'Map') {
	      return new Map(value.value);
	    }
	  }
	  return value;
	}

}

module.exports = ProjectManager;