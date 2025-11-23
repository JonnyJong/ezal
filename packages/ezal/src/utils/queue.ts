interface QueueItem<T> {
	data: T;
	next: QueueItem<T> | null;
}

export class Queue<T> {
	#first: QueueItem<T> | null = null;
	#last: QueueItem<T> | null = null;
	enqueue(data: T) {
		const item: QueueItem<T> = { data, next: null };
		if (this.#last) {
			this.#last.next = item;
			this.#last = item;
		} else {
			this.#first = item;
			this.#last = item;
		}
	}
	dequeue(): T | null {
		if (!this.#first) return null;
		const data = this.#first.data;
		this.#first = this.#first.next;
		if (!this.#first) this.#last = null;
		return data;
	}
	get isEmpty(): boolean {
		return this.#first === null;
	}
	*[Symbol.iterator](): Generator<T> {
		while (true) {
			const item = this.dequeue();
			if (item === null) return;
			yield item;
		}
	}
}
